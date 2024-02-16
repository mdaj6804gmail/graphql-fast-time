import React, {Component} from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
    state = {
        title: '',
        author: '',
        date: '',
        image: '',
        content: ''
    };

    componentDidMount() {
        const postId = this.props.match.params.postId;
        const token = localStorage.getItem("token")
        const Query = {
            query: `{post(id:"${postId}"){_id,title content imageUrl creator{_id name} createdAt}}`
        }
        fetch('http://localhost:8080/graphql', {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(Query)
        })
            .then(res => {
                // console.log(res)
                // if (res.status !== 200) {
                //     throw new Error('Failed to fetch status');
                // }
                return res.json();
            })
            .then(resData => {
                console.log(resData)
                this.setState({
                    title: resData.data.post.title,
                    author: resData.data.post.creator.name,
                    date: new Date(resData.data.post.createdAt).toLocaleDateString('en-US'),
                    content: resData.data.post.content,
                    image: `http://localhost:8080/${resData.data.post.imageUrl}`
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        return (
            <section className="single-post">
                <h1>{this.state.title}</h1>
                <h2>
                    Created by {this.state.author} on {this.state.date}
                </h2>
                <div className="single-post__image">
                    <Image contain imageUrl={this.state.image}/>
                </div>
                <p>{this.state.content}</p>
            </section>
        );
    }
}

export default SinglePost;
