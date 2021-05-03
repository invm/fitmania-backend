import admin, { ServiceAccount } from 'firebase-admin';
import credential from './firebase.json';
import { IObject } from '../../types/IObject';

const app = admin.initializeApp({
  credential: admin.credential.cert(credential as ServiceAccount),
});

module.exports = {
  sendMessage: async function (
    token: string,
    title: string,
    { body, data, image }: { body: string; data: IObject; image: string }
  ) {
    try {
      let message: admin.messaging.Message = {
        token: token,
        notification: {
          title,
          body,
        },
      };

      if (image) message.notification.imageUrl = image;

      if (data) message.data = data;

      await app.messaging().send(message);
    } catch (err) {
      console.log('err', err);
    }
  },
};
