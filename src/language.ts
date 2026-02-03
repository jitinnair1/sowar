// USER_EDITABLE: Change this import to swap languages
// The 'activeRunner' export is used by the Core system to execute code.

import { ocamlRunner as adapter } from './languages/ocaml/adapter';

export const activeRunner = adapter;
