import React from 'react';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container-fluid">
                <p>&copy; {new Date().getFullYear()} Designed by Sivaranjani Sahadevan. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
