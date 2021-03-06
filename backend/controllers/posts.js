const Post = require('../models/post.js');

const pathToImages = process.env.BACKEND_IMAGES_URL;

exports.createPost = (req, res, next) => {

  const url = req.protocol + '://' + req.get('host');

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath:  url + pathToImages + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'All done',
      post: {
        //...createdPost, next gen stuff, copies first then replaces following
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating post failed!"
    })
  });
  console.log(post);
};

exports.updatePost = (req,res,next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + pathToImages + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId // note that that req has null value on this field cause of security.
  });

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then( result => {
    if (result.nModified > 0) {
      console.log('Sucess update on: ' + post);
      res.status(200).json({ message: "Update successful!" });
    } else {
      console.log('Not authorized update on: ' + post);
      res.status(401).json({ message: 'Not authorized!' })
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Couldn't update post!"
    })
  })
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if(pageSize && currentPage) {
    postQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }

  postQuery.then(documents => {
    fetchedPosts = documents;
    return Post.countDocuments()
  }).then(count => {
    console.log('Check posts: ' + count);
    res.status(200).json({
      message : 'Fetched posts sucess!',
      posts: fetchedPosts,
      maxPosts: count
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Fetching post failed!"
    })
  });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if(post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found!'});
    }
  });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {
    if (result.n > 0) {
      console.log('Sucessful delete on: ');
      res.status(200).json({message: 'Post Deleted!'});
    } else {
      console.log('Not authorized delete!');
      res.status(401).json({ message: 'Not authorized!' })
    }
  });
}
