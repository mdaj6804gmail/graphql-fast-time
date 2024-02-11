import React, {Component, Fragment} from 'react';
import socketIo from "socket.io-client"
import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

class Feed extends Component {
    state = {
        isEditing: false,
        posts: [],
        totalPosts: 0,
        editPost: null,
        status: '',
        postPage: 1,
        postsLoading: true,
        editLoading: false,
        limit: 2,
        socketData: null
    };

    componentDidMount() {
        fetch('URL')
            .then(res => {
                if (res.status !== 200) {
                    throw new Error('Failed to fetch user status.');
                }
                return res.json();
            })
            .then(resData => {
                this.setState({status: resData.status});
            })
            .catch(this.catchError);

        this.loadPosts();

        const io = socketIo("http://localhost:8080/")
        io.on("posts", data => {
            if (data.action === "create") {
                console.log(data)
                this.addPost(data)
            } else if (data.action === "update") {
                console.log(data)
                this.updatePost(data.post)
            } else if (data.action === "delete") {
                console.log(data)
                this.loadPosts()
            }
        })


    }

    addPost = post => {
        this.setState(prevState => {
            const updatedPost = [...prevState.posts]
            if (prevState.postPage === 1) {
                if (this.state.posts.length >= 2) {
                    console.log("POP :")
                    updatedPost.pop();

                }
                updatedPost.unshift(post.post)
            }
            // }  if (prevState.postPage === 1) {
            //     updatedPost.pop()
            //     updatedPost.unshift(post)
            // }
            console.log(updatedPost)
            // return {
            //     posts: updatedPost,
            //     totalPosts: post.totalItems
            // }
            return {
                posts: updatedPost,
                isEditing: false,
                editPost: null,
                editLoading: false,
                totalPosts: post.totalItems
            };
        })
    }
    updatePost = post => {
        this.setState(prevState => {
            let updatedPosts = [...prevState.posts];
            if (prevState.editPost) {
                const postIndex = prevState.posts.findIndex(
                    p => p._id === prevState.editPost._id
                );
                updatedPosts[postIndex] = post;
            }
            // else if (prevState.posts.length < 2) {
            //     updatedPosts = prevState.posts.concat(post);
            // }
            return {
                posts: updatedPosts,
                isEditing: false,
                editPost: null,
                editLoading: false
            };
        });
    }

    loadPosts = direction => {
        if (direction) {
            this.setState({postsLoading: true, posts: []});
        }
        let page = this.state.postPage;
        let limit = this.state.limit;
        if (direction === 'next') {
            page++;
            this.setState({postPage: page});
        }
        if (direction === 'previous') {
            page--;
            this.setState({postPage: page});
        }
        fetch(`http://localhost:8080/feed/posts/?page=${2}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${this.props.token}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    throw new Error('Failed to fetch posts.');
                }
                return res.json();
            })
            .then(resData => {
                console.log(resData)
                this.setState({
                    posts: resData.posts.map(post => {
                        return {
                            ...post,
                            imagePath: post.imageUrl
                        }
                    }),
                    totalPosts: resData.totalItems,
                    postsLoading: false
                });
            })
            .catch(this.catchError);
    };

    statusUpdateHandler = event => {
        event.preventDefault();
        fetch('URL')
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error("Can't update status!");
                }
                return res.json();
            })
            .then(resData => {
                console.log(resData);
            })
            .catch(this.catchError);
    };

    newPostHandler = () => {
        this.setState({isEditing: true});
    };

    startEditPostHandler = postId => {
        this.setState(prevState => {
            const loadedPost = {...prevState.posts.find(p => p._id === postId)};

            return {
                isEditing: true,
                editPost: loadedPost
            };
        });
    };

    cancelEditHandler = () => {
        this.setState({isEditing: false, editPost: null});
    };

    finishEditHandler = postData => {
        console.log(postData)
        this.setState({
            editLoading: true
        });
        // Set up data (with image!)
        let url = 'http://localhost:8080/feed/post';
        let method = "POST"
        if (this.state.editPost) {
            url = "http://localhost:8080/feed/post/" + this.state.editPost._id;
            method = "PUT"
        }

        const formdata = new FormData()

        formdata.append("title", postData.title)
        formdata.append("content", postData.content)
        formdata.append("image", postData.image)
        // console.log(postData)
        fetch(url, {
            method: method,
            body: formdata,
            headers: {
                Authorization: `Bearer ${this.props.token}`
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Creating or editing a post failed!');
                }
                return res.json();
            })
            .then(resData => {
                // console.log(resData)
                // const post = {
                //     _id: resData._id,
                //     title: resData.title,
                //     content: resData.content,
                //     creator: resData.creator,
                //     createdAt: resData.createdAt
                // };
                // this.setState(prevState => {
                //     let updatedPosts = [...prevState.posts];
                //     if (prevState.editPost) {
                //         const postIndex = prevState.posts.findIndex(
                //             p => p._id === prevState.editPost._id
                //         );
                //         updatedPosts[postIndex] = post;
                //     }
                //     // else if (prevState.posts.length < 2) {
                //     //     updatedPosts = prevState.posts.concat(post);
                //     // }
                //     return {
                //         posts: updatedPosts,
                //         isEditing: false,
                //         editPost: null,
                //         editLoading: false
                //     };
                // });
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    isEditing: false,
                    editPost: null,
                    editLoading: false,
                    error: err
                });
            });
    };

    statusInputChangeHandler = (input, value) => {
        this.setState({status: value});
    };

    deletePostHandler = postId => {
        this.setState({postsLoading: true});
        let url = 'http://localhost:8080/feed/post/' + postId;
        fetch(url, {
            method: "DELETE", headers: {
                Authorization: `Bearer ${this.props.token}`
            }
        })
            .then(res => {

                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Deleting a post failed!');
                }
                return res.json();
            })
            .then(resData => {
                console.log(resData)
                this.loadPosts()
                // this.setState(prevState => {
                //     const updatedPosts = prevState.posts.filter(p => p._id !== postId);
                //     return {posts: updatedPosts, postsLoading: false};
                // });
            })
            .catch(err => {
                console.log(err);
                this.setState({postsLoading: false});
            });
    };

    errorHandler = () => {
        this.setState({error: null});
    };

    catchError = error => {
        this.setState({error: error});
    };

    render() {
        // console.log(this.state)
        return (
            <Fragment>
                <ErrorHandler error={this.state.error} onHandle={this.errorHandler}/>
                <FeedEdit
                    editing={this.state.isEditing}
                    selectedPost={this.state.editPost}
                    loading={this.state.editLoading}
                    onCancelEdit={this.cancelEditHandler}
                    onFinishEdit={this.finishEditHandler}
                />
                <section className="feed__status">
                    <form onSubmit={this.statusUpdateHandler}>
                        <Input
                            type="text"
                            placeholder="Your status"
                            control="input"
                            onChange={this.statusInputChangeHandler}
                            value={this.state.status}
                        />
                        <Button mode="flat" type="submit">
                            Update
                        </Button>
                    </form>
                </section>
                <section className="feed__control">
                    <Button mode="raised" design="accent" onClick={this.newPostHandler}>
                        New Post
                    </Button>
                </section>
                <section className="feed">
                    {this.state.postsLoading && (
                        <div style={{textAlign: 'center', marginTop: '2rem'}}>
                            <Loader/>
                        </div>
                    )}
                    {this.state.posts.length <= 0 && !this.state.postsLoading ? (
                        <p style={{textAlign: 'center'}}>No posts found.</p>
                    ) : null}
                    {!this.state.postsLoading && (
                        <Paginator
                            onPrevious={this.loadPosts.bind(this, 'previous')}
                            onNext={this.loadPosts.bind(this, 'next')}
                            lastPage={Math.ceil(this.state.totalPosts / 2)}
                            currentPage={this.state.postPage}
                        >
                            {this.state.posts.map(post => {
                                const myPost = post.creator._id.toString() === localStorage.getItem("userId").toString()
                                return (<Post
                                    key={post._id}
                                    id={post._id}
                                    author={post.creator.name}
                                    date={new Date(post.createdAt).toLocaleDateString('en-US')}
                                    title={post.title}
                                    image={post.imageUrl}
                                    content={post.content}
                                    myPost={myPost}
                                    onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                                    onDelete={this.deletePostHandler.bind(this, post._id)}
                                />)
                            })}
                        </Paginator>
                    )}
                </section>


                {this.state.socketData && <h2>{this.state.socketData}</h2>}
            </Fragment>
        );
    }
}

export default Feed;
