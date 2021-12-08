const router = require('express').Router();
const { User, Pokemon } = require('../../models');

// GET /api/users
router.get('/', (req, res) => {
    User.findAll({
        attributes: { exclude: ['password'] }
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// GET /api/users/1
router.get('/:id', (req, res) => {
  User.findOne({
    attributes: { exclude: ['password'] },
    where: {
      id: req.params.id
    },
    include: {
      model: Pokemon,
      attributes: ['id', 'name', 'type']
    }
  })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// POST create a new user
router.post('/', (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
  .then(userdata => {
    if (userdata) {
      res.status(400).json({ message: 'Username already exists' });
      return;
      // res.json({ message: 'Username already exists' });
    } else {
      User.create({
        username: req.body.username,
        password: req.body.password
      })
      .then(dbUserData => {
        req.session.save(() => {
          req.session.user_id = dbUserData.id;
          req.session.username = dbUserData.username;
          req.session.loggedIn = true;
      
          res.json(dbUserData);
        });
      })
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// verify user during login
router.post('/login', (req, res) => {

    User.findOne({
        where: {
          username: req.body.username
        }
      }).then(dbUserData => {
        if (!dbUserData) {
          // res.status(400).json({ message: 'No user with that username exists!' });
          res.statusMessage = "No user with that username exists!";
          res.status(400).json();
          return;
        }
        // Verify user
        const validPassword = dbUserData.checkPassword(req.body.password);
        if (!validPassword) {
            res.statusMessage = "Incorrect password."
            res.status(400).json();
            return;
          }

          req.session.save(() => {
            // declare session variables
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
          
          res.json({ user: dbUserData, message: 'You are now logged in!' });
          
           });  
        });
  });
  
// logout
router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end(); // 204 No Content success status response code indicates that a request has succeeded, but that the client doesn't need to navigate away from its current page
    });
  }
  else {
    res.status(404).end();
  }
});

// PUT /api/users/1
router.put('/:id', (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
  .then(dbUserData => {
    if (dbUserData) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }
    else {
      User.update(req.body, {
        individualHooks: true,
        where: {
          id: req.params.id
        }
      })
        .then(dbUserData => {
          if (!dbUserData[0]) {
            res.status(404).json({ message: 'No user found with this id' });
            return;
          }
          res.json(dbUserData);
        })
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
    
  // User.update(req.body, {
  //   individualHooks: true,
  //   where: {
  //     id: req.params.id
  //   }
  // })
  //   .then(dbUserData => {
  //     if (!dbUserData[0]) {
  //       res.status(404).json({ message: 'No user found with this id' });
  //       return;
  //     }
  //     res.json(dbUserData);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     res.status(500).json(err);
  //   });
});

// DELETE /api/users/1
router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
          id: req.params.id
        }
      })
        .then(dbUserData => {
          if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this id' });
            return;
          }
          res.json(dbUserData);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
});

module.exports = router;
