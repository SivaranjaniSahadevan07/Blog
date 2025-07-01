import React from 'react';

const Footer = () => {
    return (
        // <footer className="bg-dark text-white pt-2 fixed-bottom">
        <footer className="bg-dark text-white p-2 align-items-center fixed-bottom-md">
            <div className="container-fluid text-center">
                <p>&copy; {new Date().getFullYear()} BlogSite, Designed by Sivaranjani. All rights reserved.</p>
                {/* <div className="social-icons">
                    <a
                        href="https://facebook.com"
                        className="text-white me-3"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="fab fa-facebook"></i> Facebook
                    </a>
                    <a
                        href="https://twitter.com"
                        className="text-white me-3"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="fab fa-twitter"></i> Twitter
                    </a>
                    <a
                        href="https://instagram.com"
                        className="text-white"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="fab fa-instagram"></i> Instagram
                    </a>
                </div> */}
            </div>
        </footer>
    );
};

export default Footer;
