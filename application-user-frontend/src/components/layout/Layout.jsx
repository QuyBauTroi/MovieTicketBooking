import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import ScrollButton from "../scroll-button/ScrollButton";

function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <ToastContainer
                position="top-right"
                closeOnClick
                autoClose={3000}
                hideProgressBar={true}
                theme="light"
            />
            <ScrollButton />
            <Footer />
        </>
    );
}

export default Layout;
