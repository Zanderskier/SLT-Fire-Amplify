import { defineStorage} from "@aws-amplify/backend";

export const storageCongfig = {
  name: "slt-fire-pic-storage",
  isDefault: true,
  access: (allow: any) => ({
    'about-us-pictures/*x ':[
      allow.guest.to(['read', 'write', 'delete'])
    ]
  }),
}

//Export storage name only
export const storageName = storageCongfig.name;

// export storage configuration as an object
export const storage = defineStorage(defineStorage);