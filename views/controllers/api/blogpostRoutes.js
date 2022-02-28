const router = require('express').Router();
const { blogpost, User } = require('../../models');
const withAuth = require('../../utils/auth');
router.delete('/:id', withAuth, async (req, res) => {
  try {
    const blogData = await blogpost.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!blogData) {
      res.status(404).json({ message: 'No blog found with this id!' });
      return;
    }

    res.status(200).json(blogData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
