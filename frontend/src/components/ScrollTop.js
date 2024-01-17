import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

function ScrollTop(){
    const {path} = useLocation();
    
    useEffect(()=>{
        window.scrollTo(0,0);
    }, [path]
    );
};

export default ScrollTop;