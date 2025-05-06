import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
// ... other imports ...

const Community = () => {
    const location = useLocation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const commentRefs = useRef({});

    // ... existing code ...

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await getPosts();
                setPosts(response);
                setError(null);

                // Check for commentId in URL and scroll to it after posts are loaded
                const params = new URLSearchParams(location.search);
                const commentId = params.get('commentId');
                if (commentId) {
                    // Wait for posts to be rendered
                    setTimeout(() => {
                        const commentElement = commentRefs.current[commentId];
                        if (commentElement) {
                            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            commentElement.classList.add('highlight-comment');
                            setTimeout(() => {
                                commentElement.classList.remove('highlight-comment');
                            }, 2000);
                        }
                    }, 500);
                }
            } catch (err) {
                setError('Failed to load posts');
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [location.search]);

    // ... rest of the existing code ...

    return (
        <div className="community-page">
            {/* ... existing JSX ... */}
            {posts.map(post => (
                <Post
                    key={post.id}
                    post={post}
                    onCommentAdded={handleCommentAdded}
                    commentRefs={commentRefs}
                />
            ))}
            {/* ... rest of the JSX ... */}
        </div>
    );
};

export default Community; 