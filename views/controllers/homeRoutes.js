const router = require('express').Router();
const { post, User, comment } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    // Get all posts and JOIN with user data
    const userData = await User.findAll({});

    // Serialize data so the template can read it
    const users = userData.map((each) => each.get({ plain: true }));
    // Pass serialized data and session flag into template
    res.render('homeblogpage', {
      users,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err + 'jlmk');
  }
});

router.get('/blogpost/:id', async (req, res) => {
  try {
    const blogpostData = await blogpost.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    const blog = blogpostData.get({ plain: true });
    const commentData = await comment.findAll({
      where: { blog_id: req.params.id },
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });
    const comments = commentData.map((each) => each.get({ plain: true }));
    res.render('blogpost', {
      blog,
      comments,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/dashboard', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: blogpost }],
    });

    const user = userData.get({ plain: true });
    res.render('dashboard', {
      ...user,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});
router.get('/signup', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('signup');
});
router.get('/new-post', withAuth, (req, res, next) => {
  res.render('new-post');
});
router.get('/update/:id', withAuth, async (req, res, next) => {
  const blogData = await blogpost.findByPk(req.params.id);
  const blog = blogData.get({ plain: true });
  if (req.session.user_id == blog.user_id) {
    res.render('new-post', {
      edit: true,
      blog,
    });
  } else {
    res.redirect('/login');
  }
});
router.post('/create-blog', withAuth, async (req, res) => {
  if (
    req.body.title.trim().length == 0 ||
    req.body.content.trim().length == 0
  ) {
    return res.redirect('/new-post');
  }
  try {
    const newBlogpost = await blogpost.create({
      ...req.body,
      user_id: req.session.user_id,
    });
    res.status(200).redirect('/dashboard');
  } catch (err) {
    res.status(400).redirect('/new-post');
  }
});
router.post('/update-blog', withAuth, async (req, res) => {
  if (
    req.body.title.trim().length == 0 ||
    req.body.content.trim().length == 0
  ) {
    return res.redirect('/update/' + req.body.blogId);
  }
  try {
    const blog = await blogpost.findByPk(req.body.blogId);
    blog.title = req.body.title;
    blog.content = req.body.content;
    await blog.save();
    res.status(200).redirect('/dashboard');
  } catch (err) {
    res.status(400).redirect('/update/' + req.body.blogId);
  }
});
router.post('/add-comment', withAuth, async (req, res, next) => {
  if (req.body.comment.trim().length == 0) {
    return res.redirect('/blogpost/' + req.body.blogId);
  }
  try {
    const comm = await comment.create({
      comment: req.body.comment,
      blog_id: req.body.blogId,
      user_id: req.session.user_id,
    });
    res.status(200).redirect('/blogpost/' + req.body.blogId);
  } catch (err) {
    res.status(400).redirect('/blogpost/' + req.body.blogId);
  }
});

module.exports = router;
