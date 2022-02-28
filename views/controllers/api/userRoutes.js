const router = require('express').Router();
const { User } = require('../../models');

router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const u=req.body;
    const userData = await User.create({...u});
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      await req.session.save();
      res.status(200).redirect("/");

  } catch (err) {
    res.status(200).redirect("/login");
  }
});

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      // res.json({ user: userData, message: 'You are now logged in!' });
      res.status(200).redirect("/dashboard");
    });

  } catch (err) {
    res.status(400).redirect("/login");
    // res.status(400).json(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
