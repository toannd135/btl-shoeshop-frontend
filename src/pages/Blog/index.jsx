import React, { useEffect } from 'react';
import './Blog.css';

const Blog = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const blogPosts = [
        {
            id: 1,
            title: "Top 5 Sneaker Trends Thống Trị Năm 2026",
            excerpt: "Từ thiết kế chunky hoài cổ đến những đôi giày chạy bằng chất liệu tái chế, hãy cùng chúng tôi điểm qua những xu hướng sneaker đang làm mưa làm gió trong cộng đồng yêu giày năm nay.",
            image: "https://images.unsplash.com/photo-1552346154-21d32810baa3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tag: "Xu hướng",
            author: "PTIT Sneaker",
            date: "05 Tháng 4, 2026"
        },
        {
            id: 2,
            title: "Cách Phối Đồ Cực Chất Cùng Nike Air Force 1",
            excerpt: "Nike Air Force 1 không chỉ là một biểu tượng mà còn là đôi giày 'must-have' trong tủ đồ. Cùng khám phá 10 cách phối đồ từ dạo phố đến công sở với siêu phẩm này.",
            image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tag: "Style Guide",
            author: "Fashion Editor",
            date: "01 Tháng 4, 2026"
        },
        {
            id: 3,
            title: "Bí Quyết Vệ Sinh Giày Sneaker Trắng Sáng Bóng Tại Nhà",
            excerpt: "Giữ cho đôi giày trắng luôn sạch sẽ không hề khó nếu bạn biết những mẹo nhỏ này. Cùng học cách làm sạch giày sneaker trắng nhanh chóng và bảo vệ chất liệu tối đa.",
            image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tag: "Mẹo vặt",
            author: "Shoe Care",
            date: "28 Tháng 3, 2026"
        },
        {
            id: 4,
            title: "Lịch Sử Đằng Sau Đôi Giày Huyền Thoại Adidas Stan Smith",
            excerpt: "Ít ai biết rằng Adidas Stan Smith ban đầu được thiết kế cho một ngôi sao quần vợt khác trước khi mang tên huyền thoại. Hãy cùng tìm hiểu câu chuyện lịch sử thú vị của đôi giày kinh điển này.",
            image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tag: "Lịch sử",
            author: "Sneakerhead",
            date: "20 Tháng 3, 2026"
        },
        {
            id: 5,
            title: "Chạy Bộ Mùa Hè: Chọn Giày Nào Để Êm Ái Và Thoáng Mát Nhất?",
            excerpt: "Mùa hè là thử thách với đam mê chạy bộ. Việc chọn một đôi giày ưu tiên sự thoáng khí nhưng vẫn đảm bảo khả năng giảm xóc là vô cùng quan trọng.",
            image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tag: "Thể thao",
            author: "PTIT Sports",
            date: "15 Tháng 3, 2026"
        },
        {
            id: 6,
            title: "Công Nghệ Đệm Giày Mới Nhất: Cuộc Đua Giữa Các Ông Lớn",
            excerpt: "Boost của Adidas, React của Nike hay HoVR của Under Armour? Chúng ta hãy cùng so sánh những công nghệ đế giày tân tiến nhất hiện nay để tìm ra 'chân ái'.",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            tag: "Đánh giá",
            author: "Tech Review",
            date: "10 Tháng 3, 2026"
        }
    ];

    return (
        <div className="blog-container">
            <div className="blog-header">
                <h1>ShoeShop Blog</h1>
                <p>Khám phá những xu hướng mới nhất, chia sẻ bí quyết chăm sóc giày và câu chuyện văn hóa sneaker cùng chúng tôi.</p>
            </div>

            <div className="blog-grid">
                {blogPosts.map(post => (
                    <article key={post.id} className="blog-card">
                        <div style={{ overflow: 'hidden' }}>
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="blog-image" 
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }}
                            />
                        </div>
                        <div className="blog-content">
                            <span className="blog-tag">{post.tag}</span>
                            <h2 className="blog-title">{post.title}</h2>
                            <p className="blog-excerpt">{post.excerpt}</p>

                            <div className="blog-footer">
                                <span className="blog-author">{post.author}</span>
                                <span className="blog-date">{post.date}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Blog;
