import React from 'react';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container-fluid">
                <p>&copy; {new Date().getFullYear()} BlogSite, Designed by Sivaranjani. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
