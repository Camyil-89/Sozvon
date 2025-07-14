import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import Header from '../../components/header';
import Footer from '../../components/footer';

function MainPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="container mx-auto py-12 flex-grow flex pt-24">

            </div>

            <Footer />
        </div>
    );
}

export default MainPage;