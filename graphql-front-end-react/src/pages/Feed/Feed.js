import React, {Component, Fragment} from 'react';
// import socketIo from "socket.io-client"
import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import axios from "axios"
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


    }


    loadPosts = direction => {
        if (direction) {
            this.setState({postsLoading: true, posts: []});
        }
        let page = this.state.postPage;

        if (direction === 'next') {
            page++;
            this.setState({postPage: page});
        }
        if (direction === 'previous') {
            page--;
            this.setState({postPage: page});
        }

        const PostQuery = {
            query: `
          query{
    getPosts(page:${page}){totalPost,posts{_id title content imageUrl createdAt creator{_id email name}}}
}
            `
        }


        fetch("http://localhost:8080/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.token}`,
            },
            body: JSON.stringify(PostQuery)
        })
            .then(res => {
                // console.log(res)
                if (res.status !== 200) {
                    throw new Error('Failed to fetch posts.');
                }
                return res.json();
            })
            .then(resData => {
                console.log(resData)
                this.setState({
                    posts: resData.data.getPosts.posts.map(post => {
                        return {
                            ...post,
                            imagePath: post.imageUrl
                        }
                    }),
                    totalPosts: resData.data.getPosts.totalPost,
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
        console.log(postData)
        // Set up data (with image!)
        // let url = 'http://localhost:8080/feed/post';
        // let method = "POST"
        // if (this.state.editPost) {
        //     url = "http://localhost:8080/feed/post/" + this.state.editPost._id;
        //     method = "PUT"
        // }
        //
        const formdata = new FormData()
        //
        // formdata.append("title", postData.title)
        // formdata.append("content", postData.content)
        formdata.append("image", postData.image)
        axios.post("http://localhost:8080/image-upload", formdata, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.props.token}`,
                "Content-Type": "multipart/form-data"
            }

        }).then(resData => {
            console.log(resData.data)

            let graphqlQuery = {
                query: ` mutation{
            createPost(input:{
            title:"${postData.title}",
            content:"${postData.content}",
            imageUrl:"${resData.data}"}){
           _id title content imageUrl createdAt
            creator {
                name
        }}}`
            }
            if (this.state.editPost!==null) {
                // const isuser =this.state.editPost.creator._id === localStorage.getItem("userId")
                // if (!isuser){
                //     throw new Error('User Not Authenticated');
                // }
                console.log("Hello world!")
                graphqlQuery = {
                    query: `mutation{updatePost(input:{
                title:"${postData.title}",content:"${postData.content}",
                imageUrl:"${resData.data}",id:"${this.state.editPost._id}"}){
                _id title content imageUrl createdAt
                 creator{name _id}}}`
                }
            }
            console.log(graphqlQuery)
            return fetch("http://localhost:8080/graphql", {
                method: "POST",
                body: JSON.stringify(graphqlQuery),
                headers: {
                    Authorization: `Bearer ${this.props.token}`,
                    "Content-Type": "application/json"
                }
            })

        }).then(res => {
            console.log(res)
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Creating or editing a post failed!');
            }
            return res.json();
        })
            .then(resData => {
                console.log(resData)
                // console.log(resData)

                const post =this.state.editPost===null? {
                    _id: resData.data.createPost._id,
                    title: resData.data.createPost.title,
                    content: resData.data.createPost.content,
                    creator: resData.data.createPost.creator,
                    createdAt: resData.data.createPost.createdAt
                }:{
                    _id: resData.data.updatePost._id,
                    title: resData.data.updatePost.title,
                    content: resData.data.updatePost.content,
                    creator: resData.data.updatePost.creator,
                    createdAt: resData.data.updatePost.createdAt
                };
                this.setState(prevState => {
                    this.loadPosts()
                    // let updatedPosts = [...prevState.posts];
                    // if (updatedPosts.length > 1) {
                    //     updatedPosts.shift()
                    // }
                    // updatedPosts.unshift(post)


                    // if (prevState.editPost) {
                    //     const postIndex = prevState.posts.findIndex(
                    //         p => p._id === prevState.editPost._id
                    //     );
                    //     updatedPosts[postIndex] = post;
                    // }
                    // else if (prevState.posts.length < 2) {
                    //     updatedPosts = prevState.posts.concat(post);
                    // }
                    return {
                        // posts: updatedPosts,
                        isEditing: false,
                        editPost: null,
                        editLoading: false
                    };
                });
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
        let url = 'http://localhost:8080/graphql';
        const deleteQuery = {
            query: `{deletePost(id:"${postId}"){_id message}}`
        }

        fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.props.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(deleteQuery)
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
                this.setState(prevState => {
                    const updatedPosts = prevState.posts.filter(p => p._id !== postId);
                    return {posts: updatedPosts, postsLoading: false};
                });
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
        console.log(this.state)
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
