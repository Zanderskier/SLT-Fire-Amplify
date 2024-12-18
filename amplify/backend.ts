import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from "./storage/resource";

export const backend = defineBackend({
  auth,
  data,
  storage,
});
