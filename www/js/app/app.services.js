angular.module('your_app_name.app.services', [])

.service('AuthService', function() {

    this.saveUser = function(user) {
        window.localStorage.your_app_name_user = JSON.stringify(user);
    };

    this.getLoggedUser = function() {

        return (window.localStorage.your_app_name_user) ?
            JSON.parse(window.localStorage.your_app_name_user) : null;
    };

})

.service('PostService', function($http, $q, OpenFB) {

    this.getUserDetails = function(userId) {
        var dfd = $q.defer();

        $http.get('database.json').success(function(database) {
            //find the user
            var user = _.find(database.users, function(user) {
                return user._id == userId;
            });
            dfd.resolve(user);
        });

        return dfd.promise;
    };

    this.getPost = function(postId) {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            var post = _.find(database.posts, function(posts) {
                return posts.id == postId;
            });
            post.user = _.find(database.users, function(user) {
                return user._id == post.userId;
            });
            for (var i = post.feed_comment.length - 1; i >= 0; i--) {
                post.feed_comment[i].user = _.find(database.users, function(user) {
                    return user._id == post.feed_comment[i].userId;
                });
            };
            dfd.resolve(post);
        });
        return dfd.promise;
    };

    this.getUserPosts = function(userId) {
        var dfd = $q.defer();

        $http.get('database.json').success(function(database) {

            //get user posts
            var userPosts = _.filter(database.posts, function(post) {
                return post.userId == userId;
            });
            //sort posts by published date
            var sorted_posts = _.sortBy(userPosts, function(post) {
                return new Date(post.date);
            });

            //find the user
            var user = _.find(database.users, function(user) {
                return user._id == userId;
            });

            //add user data to posts
            var posts = _.each(sorted_posts.reverse(), function(post) {
                post.user = user;
                return post;
            });

            dfd.resolve(posts);
        });

        return dfd.promise;
    };






    this.getUserLikes = function(objID) {
        var dfd = $q.defer();

        OpenFB.get('/' + objID + '/likes', { limit: 300 })
            .success(function(likes) {
                dfd.resolve(likes.data);

            })
            .error(function(data) {

            });

        return dfd.promise;

    };

    this.getFeedHostpital = function(page) {
        var pageSize = 5, // set your page size, which is number of records per page
            skip = pageSize * (page - 1),
            totalPosts = 1,
            totalPages = 1,
            dfd = $q.defer();
        dfd2 = $q.defer();
        var hospital_ID = [256097964403278, 98150133139, 180515832148454];
        var xx = [];
        var cnt = 0;
        for (var i = hospital_ID.length - 1; i >= 0; i--) {
            hospital_ID[i]
            OpenFB.get('/' + hospital_ID[i] + '/posts?fields=full_picture,message,updated_time,from,picture', { limit: 20 })
                .success(function(result) {
                    xx = xx.concat(result.data)
                    cnt++;
                    if (cnt == hospital_ID.length) {
                        totalPosts = xx.length;
                        totalPages = totalPosts / pageSize;
                        var sortedPosts = _.sortBy(xx, function(post) {
                                return new Date(post.updated_time);
                            }),
                            postsToShow = sortedPosts;

                        //add user data to posts
                        var cnt2 = 0;

                        var posts = _.each(postsToShow.reverse(), function(post) {
                            // post.user = _.find(database.users, function(user) {
                            //     return user._id == post.userId;
                            // });
                            // return post;
                            OpenFB.get('/' + post.id + '/likes', { limit: 300 })
                                .success(function(likes) {
                                    cnt2++;
                                    post.likes = likes.data;
                                    if (cnt2 == postsToShow.length) {
                                        dfd.resolve({
                                            posts: posts.slice(skip, skip + pageSize),
                                            totalPages: totalPages
                                        });
                                    }

                                })
                                .error(function(data) {

                                });

                        });


                    }

                })
                .error(function(data) {

                });

        };



        return dfd.promise;

        //var items;


    };

    this.sendLike = function(objID) {
        OpenFB.post('/' + objID + '/likes', { limit: 200 })
            .success(function(likes) {


            })
            .error(function(data) {

            });
    }
})

.service('ShopService', function($http, $q, _) {

    this.getHospital = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.hospital);
        });
        return dfd.promise;
    };

    this.getProducts = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.products);
        });
        return dfd.promise;
    };

    this.getProduct = function(productId) {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            var product = _.find(database.products, function(product) {
                return product._id == productId;
            });

            dfd.resolve(product);
        });
        return dfd.promise;
    };

    this.addProductToCart = function(productToAdd) {
        var cart_products = !_.isUndefined(window.localStorage.ionTheme1_cart) ? JSON.parse(window.localStorage.ionTheme1_cart) : [];

        //check if this product is already saved
        var existing_product = _.find(cart_products, function(product) {
            return product._id == productToAdd._id;
        });


        cart_products.push(productToAdd);


        window.localStorage.ionTheme1_cart = JSON.stringify(cart_products);
    };

    this.getCartProducts = function() {
        return JSON.parse(window.localStorage.ionTheme1_cart || '[]');
    };

    this.removeProductFromCart = function(productToRemove) {
        var cart_products = JSON.parse(window.localStorage.ionTheme1_cart);

        var new_cart_products = _.reject(cart_products, function(product) {
            return product._id == productToRemove._id;
        });

        window.localStorage.ionTheme1_cart = JSON.stringify(new_cart_products);
    };

    this.getProductsAppointMent = function(product_appointment) {
        var product_id = parseInt(product_appointment);
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            var product = _.find(database.products, function(product) {
                return product._id == product_id;
            });

            dfd.resolve(product);
        });
        return dfd.promise;
    };

})




;
