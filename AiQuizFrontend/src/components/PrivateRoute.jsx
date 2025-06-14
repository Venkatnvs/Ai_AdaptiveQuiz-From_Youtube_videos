import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchUser } from '@/store/actions/authActions';
import { useEffect } from 'react';

const PrivateRoute = () => {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth?.authTokens?.access && auth?.authTokens?.refresh && !auth?.user?.email) {
      dispatch(fetchUser());
    }
  }, []);

  return (
    (auth?.authTokens?.access && auth?.authTokens?.refresh) ?  
    (
        <Outlet />
    )
    : <Navigate to="/login" replace={true} />
  );
};

export default PrivateRoute;
