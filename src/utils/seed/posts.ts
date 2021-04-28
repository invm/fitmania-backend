import './init';
import Post from '../../models/Post';
import User from '../../models/User';
import { createUserFolder, download } from './users';
import faker from 'faker';
import chalk from 'chalk';

const getPostImage = async (userId: string, sport: string) => {
  return new Promise(async (resolve, reject) => {
    let filename = '';
    let ext = '.jpeg';
    filename = `${userId}/${userId}${Date.now()}${ext}`;

    await createUserFolder(userId);

    download(
      `https://source.unsplash.com/800x450/?${sport}`,
      `./src/media/${filename}`,
      () => {
        resolve(`${filename}`);
      }
    );
  });
};

const createPost = async (userId: string, sport: string) => {
  let imageBool = Math.floor(Math.random() * 2);
  let image = imageBool ? await getPostImage(userId, sport) : '';
  let eventBool = Math.floor(Math.random() * 2);
  let user = await User.findOne({ _id: userId });

  let post = {
    user: userId,
    image,
    text: faker.lorem.lines(2),
  } as typeof Post;

  if (eventBool) {
    let limit = Math.floor(Math.random() * 7) + 2;
    post.isEvent = true;
    post.event = {
      eventType: sport,
      participants: [userId],
      openEvent: true,
      rejectedParticipants: [],
      pendingApprovalParticipants: [],
      limitParticipants: limit,
      pace: 'Medium',
      startDate:
        new Date().getTime() + 3600000 * Math.floor(Math.random() * 48),
      initiator: userId,
    };
  }

  let postDoc = new Post(post);

  await postDoc.save();
  user.posts.push(postDoc._id);
  await user.save();

  console.log(
    chalk.greenBright(
      `[CREATED POST BY ${user.name} ${user?.lastname}] ${
        eventBool ? 'WITH' : 'WITHOUT'
      } EVENT`
    )
  );
};

const populatePosts = async (number: number) => {
  let users = await User.find({}).lean();
  let postsPromises = Array(number)
    .fill('')
    .map(
      (_) =>
        new Promise(async (resolve, reject) => {
          let user = users[Math.floor(Math.random() * users.length)];
          let sport =
            user.preferable[Math.floor(Math.random() * user.preferable.length)];

          if (sport) {
            await createPost(user._id, sport);
          }
          resolve('');
        })
    );

  await Promise.all(postsPromises);
};

populatePosts(+process.argv[3]);
