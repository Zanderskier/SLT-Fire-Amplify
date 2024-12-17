import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "amplify-gen2-files",
  access: (allow) => ({
    "aboutUsPic/*": [allow.guest.to(["read", "write", "delete"])],
  }),
});