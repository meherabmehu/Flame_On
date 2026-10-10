/* Procedural WebGL concept artwork. No catalog values or combustion model. */
const HeroFlame = (function () {
  const vertexSource = 'attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}';
  const fragmentSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_time;
    mat2 turn(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
    vec3 orient(vec3 p){p.xz=turn(u_pointer.x+sin(u_time*.17)*.10)*p.xz;p.yz=turn(u_pointer.y+sin(u_time*.13)*.06)*p.yz;return p;}
    float glow(float d,float size){return exp(-d*d/size);}
    vec3 ring(vec3 ro,vec3 rd,float radius,float tilt,float phase){
      ro.y+=1.15;ro.yz=turn(tilt)*ro.yz;rd.yz=turn(tilt)*rd.yz;
      float t=-ro.y/(abs(rd.y)<.001?.001:rd.y);vec3 p=ro+rd*t;
      float d=abs(length(p.xz)-radius),a=atan(p.z,p.x);
      float arc=.28+.72*pow(.5+.5*sin(a*2.0+u_time*phase),3.0);
      return vec3(.10,.59,.91)*(glow(d,.00012)*.6+glow(d,.002)*.10)*arc*step(0.,t);
    }
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
      vec3 ro=orient(vec3(0.,.12,6.2));
      vec3 rd=orient(normalize(vec3(uv*2.0,-3.5)));
      vec3 col=vec3(.008,.020,.039);
      float halo=exp(-dot(uv-vec2(.02,.06),uv-vec2(.02,.06))*5.0);
      col+=vec3(.005,.05,.11)*halo;
      col+=ring(ro,rd,1.40,.05,.22)+ring(ro,rd,1.68,-.08,-.17)+ring(ro,rd,1.98,.13,.13);
      // A tilted orbit exists in world space, not a flat canvas transform.
      col+=ring(ro,rd,2.02,.70,-.12)*.65;
      float trans=1.0;
      for(int i=0;i<STEPS;i++){
        float t=4.45+float(i)*(3.4/float(STEPS));
        vec3 p=ro+rd*t;
        p.y-=.12+sin(u_time*.6)*.07;
        p.xz=turn(u_time*.09+p.y*.24)*p.xz;
        float wave=sin(p.x*6.+u_time*.8)*sin(p.y*5.-u_time*.7)*sin(p.z*5.+u_time*.5);
        float y=(p.y+.05)/1.29;
        float taper=1.-.29*clamp(y,-1.,1.);
        float d=length(vec3(p.x/(.73*taper),y,p.z/(.68*taper)))+wave*.055;
        float shell=glow(d-1.,.0012);
        float gas=max(0.,1.-d)*(.55+.45*sin(p.y*7.+p.z*6.-u_time*1.1));
        float inner=length(vec3(p.x/.37,(p.y+.43)/.58,p.z/.36));
        float core=exp(-inner*inner*1.5)*(1.+.08*sin(u_time*1.4));
        float vein=.5+.5*sin(atan(p.z,p.x)*9.+p.y*8.-u_time*.6+sin(p.y*5.+u_time*.4)*1.5);
        float ribbon=pow(vein,12.)*max(0.,1.-abs(d-.82)*5.);
        vec3 light=vec3(.04,.48,1.4)*shell*.19;
        light+=vec3(1.0,.22,.025)*gas*.16;
        light+=vec3(1.4,.44,.045)*core*.32;
        light+=mix(vec3(.05,.45,1.),vec3(1.,.42,.055),clamp(1.-d,0.,1.))*ribbon*.12;
        light+=vec3(.22,.49,.85)*gas*.035;
        col+=light*trans*(36./float(STEPS));
        trans*=1.-clamp(gas*.035+core*.025,0.,.09);
      }
      for(int j=0;j<12;j++){
        float n=float(j),a=n*2.399+u_time*(.07+mod(n,3.)*.017);
        float r=1.6+mod(n,3.)*.18;
        vec3 point=vec3(cos(a)*r,-.93+sin(a)*.47+mod(n,3.)*.42,sin(a)*r);
        float t=max(0.,dot(point-ro,rd));float d=length(ro+rd*t-point);
        vec3 tint=mod(n,3.)<1.?vec3(1.,.46,.12):vec3(.08,.65,1.);
        col+=tint*(glow(d,.0015)*.9+glow(d,.016)*.20);
      }
      // Fine, subdued stars; coordinates are decorative, never measurements.
      vec2 cell=floor(uv*170.);float seed=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
      vec2 local=fract(uv*170.)-.5;
      col+=vec3(.20,.47,.70)*glow(length(local),.015)*step(.993,seed)*(.7+.3*sin(u_time*.3+seed*40.));
      float base=glow(length(uv-vec2(0.,-.34)),.006);
      col+=vec3(.8,.29,.07)*base*.32;
      col=1.-exp(-col*1.35);
      col=pow(col,vec3(.82));
      gl_FragColor=vec4(col,1.);
    }`;

  function mount(figure) {
    if (!window.matchMedia || !window.WebGLRenderingContext) {
      figure.dataset.sceneState = 'unsupported';
      return { destroy() {} };
    }
    const canvas = figure.querySelector('canvas');
    const control = figure.querySelector('[data-hero-motion]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 640px)');
    let motionReduced = reduce.matches;
    const lowPower = !!navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const abort = new AbortController();
    const listen = (target, name, handler) => target.addEventListener(name, handler, { signal: abort.signal });
    let gl = null, program = null, buffer = null, uniforms = null;
    let frame = 0, last = 0, time = 0, frames = 0, visible = true, paused = false, lost = false, destroyed = false;
    let px = 0, py = 0, tx = 0, ty = 0;
    let resizeObserver, intersectionObserver;
    const state = { inspect: () => ({ frames, time, pointer: [px, py], running: !!frame, destroyed, width: canvas.width, height: canvas.height }), destroy };
    canvas.heroScene = state;

    function fallback(reason) {
      stop(); figure.dataset.sceneState = reason;
      canvas.hidden = true; control.hidden = true;
    }
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Hero shader unavailable'); }
      return shader;
    }
    function initialize() {
      if (destroyed || motionReduced || lost) { fallback(motionReduced ? 'reduced-motion' : 'unavailable'); return; }
      if (!window.WebGLRenderingContext) { fallback('unsupported'); return; }
      if (!gl) {
        try {
          gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
          if (!gl) { fallback('unsupported'); return; }
          const vertex = compile(gl.VERTEX_SHADER, vertexSource);
          const fragment = compile(gl.FRAGMENT_SHADER, '#define STEPS ' + (lowPower ? '24' : '36') + '\n' + fragmentSource);
          program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
          gl.deleteShader(vertex); gl.deleteShader(fragment);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Hero program unavailable');
          gl.useProgram(program);
          buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
          const location = gl.getAttribLocation(program, 'a_position'); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
          uniforms = ['u_resolution','u_time','u_pointer'].map((name) => gl.getUniformLocation(program, name));
        } catch (e) { release(); fallback('unsupported'); return; }
      }
      canvas.hidden = false; control.hidden = false;
      figure.dataset.sceneState = lowPower ? 'webgl-low-power' : 'webgl';
      resize(); sync();
    }
    function resize() {
      if (!gl || lost || motionReduced || destroyed) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, small.matches ? 1 : 1.5);
      const budget = small.matches || lowPower ? 230000 : 440000;
      const scale = Math.min(dpr, Math.sqrt(budget / Math.max(1, rect.width * rect.height)));
      canvas.width = Math.max(1, Math.round(rect.width * scale)); canvas.height = Math.max(1, Math.round(rect.height * scale));
      gl.viewport(0,0,canvas.width,canvas.height);
      draw();
    }
    function draw() {
      if (!gl || lost || destroyed) return;
      gl.uniform2f(uniforms[0], canvas.width, canvas.height); gl.uniform1f(uniforms[1], time); gl.uniform2f(uniforms[2], px, py);
      gl.drawArrays(gl.TRIANGLES,0,6); frames++;
    }
    function tick(now) {
      frame = 0;
      if (destroyed || !visible || document.hidden || motionReduced || paused || lost) return;
      const elapsed = last ? now - last : 34;
      if (elapsed >= (lowPower ? 50 : 32)) {
        const delta = Math.min(elapsed / 1000, .08); last = now; time += delta;
        const damping = 1 - Math.exp(-delta * 5);
        px += (tx-px)*damping; py += (ty-py)*damping;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; }
    function sync() {
      stop();
      if (gl && visible && !document.hidden && !motionReduced && !paused && !lost && !destroyed) frame = requestAnimationFrame(tick);
      control.setAttribute('aria-pressed', String(paused)); control.textContent = paused ? 'Resume motion' : 'Pause motion';
    }
    function pointer(event) {
      if (motionReduced || paused) return;
      if (event.pointerType === 'touch' && event.buttons === 0) return;
      const rect = figure.getBoundingClientRect();
      tx = Math.max(-.25,Math.min(.25,((event.clientX-rect.left)/rect.width-.5)*.45));
      ty = Math.max(-.16,Math.min(.16,((event.clientY-rect.top)/rect.height-.5)*.30));
    }
    function release() {
      if (gl && !gl.isContextLost()) { if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program); }
      buffer = null; program = null; uniforms = null; gl = null;
    }
    function destroy() {
      if (destroyed) return; destroyed = true; stop(); abort.abort(); resizeObserver?.disconnect(); intersectionObserver?.disconnect();
      reduce.removeEventListener('change', motionChanged); small.removeEventListener('change', resize);
      const context = gl; release(); context?.getExtension('WEBGL_lose_context')?.loseContext();
    }
    listen(figure,'pointermove',pointer);
    listen(figure,'pointerleave',() => { tx = 0; ty = 0; });
    listen(control,'click',() => { paused = !paused; sync(); });
    listen(document,'visibilitychange',sync);
    function motionChanged(event) { motionReduced = event.matches; if (motionReduced) fallback('reduced-motion'); else initialize(); }
    reduce.addEventListener('change', motionChanged);
    small.addEventListener('change', resize);
    listen(canvas,'webglcontextlost',(event) => { event.preventDefault(); lost = true; fallback('context-lost'); });
    listen(canvas,'webglcontextrestored',() => { lost = false; release(); initialize(); });
    if (window.ResizeObserver) { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(figure); }
    else listen(window,'resize',resize);
    if (window.IntersectionObserver) { intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold:.02}); intersectionObserver.observe(figure); }
    initialize();
    return state;
  }
  return { mount };
})();
