import React from "react";
import { Switch, Route } from "react-router-dom";
import Cart from "./Cart";
import Landing from "./Landing";
import Login from "./Login";
import Profile from "./Profile";
import Register from "./Register";
import Search from "./Search";
import Vinyl from "./Vinyl";
import Homepage from "./Homepage";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Admin from "./Admin";
import Checkout from "./Checkout";
import CheckoutSummary from "./CheckoutSummary";
import CheckoutEnd from "./CheckoutEnd";
import OrderDetails from "./OrderDetails";

const Navigation = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Landing />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/register">
        <Register />
      </Route>
      <Route exact path="/forgot-password">
        <ForgotPassword />
      </Route>
      <Route exact path="/reset-password">
        <ResetPassword />
      </Route>
      <Route exact path="/vinyl/:sku">
        <Vinyl />
      </Route>
      <Route exact path="/homepage">
        <Homepage />
      </Route>
      <Route exact path="/profile/user">
        <Profile />
      </Route>
      <Route exact path="/profile/order-history">
        <Profile />
      </Route>
      <Route exact path="/profile/edit-profile">
        <Profile />
      </Route>
      <Route exact path="/profile/edit-shipping">
        <Profile />
      </Route>
      <Route exact path="/profile/change-password">
        <Profile />
      </Route>
      <Route exact path="/cart">
        <Cart />
      </Route>
      <Route exact path="/admin/dashboard">
        <Admin />
      </Route>
      <Route exact path="/admin/products">
        <Admin />
      </Route>
      <Route exact path="/admin/users">
        <Admin />
      </Route>
      <Route exact path="/admin/orders">
        <Admin />
      </Route>
      <Route exact path="/search">
        <Search />
      </Route>
      <Route exact path="/checkout">
        <Checkout />
      </Route>
      <Route exact path="/checkout/summary">
        <CheckoutSummary />
      </Route>
      <Route exact path="/checkout/end">
        <CheckoutEnd />
      </Route>
      <Route exact path="/order/:orderId">
        <OrderDetails />
      </Route>
    </Switch>
  );
};

export default Navigation;
