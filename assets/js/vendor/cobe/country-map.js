// Local Cobe extension: color the sphere by full country geometry rather than markers.
export function countryMapFragment(source) {
  return source.replace('uniform sampler2D z;', 'uniform sampler2D z,cMap;uniform float cMapEnabled;')
    .replace('vec3 d=B(h*o,g);', `vec3 d=B(h*o,g);
      if(cMapEnabled>.5){
        vec3 world=h*o;
        vec2 uv=vec2(fract(.5+atan(-world.z,world.x)/6.283185),.5-asin(clamp(world.y,-1.,1.))/3.141593);
        vec4 region=texture2D(cMap,uv);
        float dotMask=smoothstep(.0055,0.,g);
        float light=.78+.22*pow(i,.5);
        vec3 color=mix(F,region.rgb,region.a*(.48+.52*dotMask))*light;
        color=mix(color,w,pow(1.-i,4.)*.16);
        gl_FragColor=vec4(color,n.w);return;
      }`);
}

export function createCountryLayer(gl, uniforms) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  let enabled = false;
  return {
    update(canvas) {
      if (!canvas) return;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      enabled = true;
    },
    bind() {
      gl.uniform1i(uniforms.cMap, 1);
      gl.uniform1f(uniforms.cMapEnabled, enabled ? 1 : 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.activeTexture(gl.TEXTURE0);
    },
    destroy() { gl.deleteTexture(texture); }
  };
}
