import { PixelmatchOptions } from 'pixelmatch';

export interface ProtractorConfig {
  configDir: string;
  snapshots?: {
    dir?: string;
    update?: boolean;
    pixelmatch?: PixelmatchOptions;
  };
}

export interface Size {
  width: number;
  height: number;
}
