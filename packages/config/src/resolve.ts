import Ajv from 'ajv';
import { createConfigurationResolver } from './resolve-core.ts';
export const resolveConfiguration = createConfigurationResolver(new Ajv({ strict:true,allErrors:false,coerceTypes:false,useDefaults:false,removeAdditional:false }));
