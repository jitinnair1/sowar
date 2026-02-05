//The 'activeRunner' export is used by the core system to execute code. So
//any new language added will have to export an adapter with the same interface.
import { ocamlRunner as adapter } from './languages/ocaml/adapter';
export const activeRunner = adapter;