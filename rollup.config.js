import typescript from 'rollup-plugin-typescript2'
import packageFile from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageFile.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    }
  ],
  plugins: [
    typescript()
  ],
  external: ['react']
};
