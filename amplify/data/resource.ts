import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Subscribers: a
    .model({
      email: a.email(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

    //Calendar tables

    Event: a
    .model({
      eventTitle: a.string(),
      eventStartDate: a.date(),
      eventEndDate: a.date(),
      eventStartTime: a.time(),
      eventEndTime: a.time(),
      eventLocation: a.string(),
      eventDetails: a.string(),
      allday: a.boolean(),
      attendents: a.hasMany('EventAttentants', 'eventId'),

    })
    .authorization((allow) => [allow.publicApiKey()]),

    Attendee: a
    .model({
      nameFirst: a.string(),
      nameLast: a.string(),
      phoneNumber: a.string(),
      email: a.email(),
      partySize: a.integer(),
      events: a.hasMany('EventAttentants', 'attendeeId'),

    }).authorization((allow) => [allow.publicApiKey()]),

    EventAttentants: a
    .model({
      eventId: a.id().required(),
      attendeeId: a.id().required(),
      event: a.belongsTo('Event', 'eventId'),
      attendee: a.belongsTo('Attendee', 'attendeeId'),

    }).authorization((allow) => [allow.publicApiKey()]),

    aboutUs: a
    .model({
      picture: a.string(),
      name: a.string(),
      title: a.string(),
      description: a.string(),

    })
    .authorization((allow) => [allow.publicApiKey()]),

    ourWork: a
    .model({
      picture: a.string(),
      business: a.string(),
      description: a.string(),

    })
    .authorization((allow) => [allow.publicApiKey()]),
  });

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

