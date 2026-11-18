/**
 * Gentle "beauty" pass for the live camera, done on the GPU (WebGL) so it runs at full frame rate.
 * - Smooths skin only: an edge-preserving (bilateral) blur, masked to skin tones, so eyes, brows,
 *   lips, hair and backgrounds stay sharp.
 * - A touch of brightness and warmth in the midtones, like flattering booth light.
 * The same renderer draws the preview and the captured photo, so what you see is what you get.
 * Strength 0 = untouched.
 */
const VS = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FS = `precision mediump float;
uniform sampler2D t,eyeT,lipT;uniform vec2 px;uniform float s,eyeA,lipA;varying vec2 v;
float luma(vec3 c){return dot(c,vec3(.299,.587,.114));}
float skin(vec3 c){
  float y=dot(c,vec3(.299,.587,.114));
  float cb=(c.b-y)*.564+.5, cr=(c.r-y)*.713+.5;
  return smoothstep(.26,.31,cb)*(1.-smoothstep(.49,.54,cb))*smoothstep(.505,.545,cr)*(1.-smoothstep(.665,.71,cr))*smoothstep(.12,.22,y);
}
void main(){
  vec3 c0=texture2D(t,v).rgb;
  vec3 sum=c0;float ws=1.;
  for(int ring=1;ring<=3;ring++){
    float r=float(ring)*2.6;
    for(int i=0;i<8;i++){
      float a=float(i)*.785398+float(ring)*.4;
      vec3 c=texture2D(t,v+vec2(cos(a),sin(a))*r*px).rgb;
      vec3 d=c-c0;
      float w=exp(-dot(d,d)*90.);
      sum+=c*w;ws+=w;
    }
  }
  vec3 sm=sum/ws;
  float m=skin(c0)*s;
  vec3 o=mix(c0,sm,m*.9);
  // under-eye concealer (frequency separation): swap the dark/purple base for the cheek tone, keep the texture
  vec4 e=texture2D(eyeT,v);
  float ea=e.a*eyeA;
  if(ea>.001){
    vec3 base=mix(sm,e.rgb,.85);
    base=mix(base,base*(luma(sm)+.06)/max(luma(base),.01),.25); // keep some of the local shading, slightly lifted
    o=mix(o,clamp(base+(c0-sm)*.6,0.,1.),ea);
  }
  // lip tint: take the shade's colour, keep the lips' own light and shadow
  vec4 L=texture2D(lipT,v);
  float la=L.a*lipA;
  if(la>.001){
    float lo=luma(o);
    vec3 tint=clamp(L.rgb+(lo*.92-luma(L.rgb)),0.,1.);
    o=mix(o,tint,la);
  }
  o=mix(o,pow(o,vec3(.9)),s*.45);            // lift midtones, keeps blacks
  o*=vec3(1.+.025*s,1.+.008*s,1.-.012*s);   // a little warmth
  gl_FragColor=vec4(clamp(o,0.,1.),1.);
}`;

export class Beauty {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private tex: WebGLTexture;
  private uPx: WebGLUniformLocation; private uS: WebGLUniformLocation;
  private eyeTex: WebGLTexture; private lipTex: WebGLTexture;
  private uEye: WebGLUniformLocation; private uLip: WebGLUniformLocation;
  private hasMasks = false;

  private constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.canvas = canvas; this.gl = gl;
    const sh = (type: number, src: string) => { const x = gl.createShader(type)!; gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x) ?? 'shader'); return x; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.tex = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.uPx = gl.getUniformLocation(prog, 'px')!; this.uS = gl.getUniformLocation(prog, 's')!;
    this.uEye = gl.getUniformLocation(prog, 'eyeA')!; this.uLip = gl.getUniformLocation(prog, 'lipA')!;
    const mk = (unit: number) => {
      const x = gl.createTexture()!; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, x);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      return x;
    };
    this.eyeTex = mk(1); this.lipTex = mk(2);
    gl.uniform1i(gl.getUniformLocation(prog, 't'), 0); gl.uniform1i(gl.getUniformLocation(prog, 'eyeT'), 1); gl.uniform1i(gl.getUniformLocation(prog, 'lipT'), 2);
    gl.activeTexture(gl.TEXTURE0);
  }

  /** Upload the face masks (see lib/face.ts). Pass null to clear them. */
  setMasks(eyes: HTMLCanvasElement | null, lips: HTMLCanvasElement | null) {
    const gl = this.gl;
    const up = (unit: number, tex: WebGLTexture, c: HTMLCanvasElement | null) => {
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex);
      if (c) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    };
    up(1, this.eyeTex, eyes); up(2, this.lipTex, lips); gl.activeTexture(gl.TEXTURE0);
    this.hasMasks = !!(eyes && lips);
  }

  /** Returns null when WebGL isn't available (the caller then shows the plain video). */
  static create(canvas: HTMLCanvasElement = document.createElement('canvas')): Beauty | null {
    try {
      const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false });
      return gl ? new Beauty(canvas, gl) : null;
    } catch { return null; }
  }

  /** Draw one frame of `src` with the given strength (0..1). */
  draw(src: HTMLVideoElement | HTMLCanvasElement, strength: number, touch: { eye: number; lip: number } = { eye: 0, lip: 0 }) {
    const w = src instanceof HTMLVideoElement ? src.videoWidth : src.width, h = src instanceof HTMLVideoElement ? src.videoHeight : src.height;
    if (!w || !h) return false;
    const gl = this.gl;
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
    gl.uniform1f(this.uEye, this.hasMasks ? touch.eye : 0); gl.uniform1f(this.uLip, this.hasMasks ? touch.lip : 0);
    // blur radius follows image size, so 720p and 1080p cameras look the same
    const k = Math.max(1, Math.min(w, h) / 720);
    gl.uniform2f(this.uPx, k / w, k / h); gl.uniform1f(this.uS, strength);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }

  /** Copy the current frame into a normal 2D canvas (for the strip). */
  snapshot() {
    const c = document.createElement('canvas'); c.width = this.canvas.width; c.height = this.canvas.height;
    c.getContext('2d')!.drawImage(this.canvas, 0, 0); return c;
  }
}

/** s = skin smoothing/glow, eye = under-eye concealer, lip = lip tint opacity. */
export const BEAUTY_LEVELS = [
  { name: 'off', s: 0, eye: 0, lip: 0 },
  { name: 'natural', s: 0.55, eye: 0.7, lip: 0.42 },
  { name: 'soft glow', s: 1, eye: 0.85, lip: 0.55 },
] as const;
