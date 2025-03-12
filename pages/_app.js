import Layout from '../shared/components/layout'
import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import { useRouter } from "next/router";

import { ToastContainer } from "react-toastify";







const pathsWithoutDefaultLayout = [
  "/",
  "/self-management",
  "/users/login",
  "/financialProfile/financialStatement",
  "/financialProfile/indicators",
  "/auth/resetPassword",
  "/auth/forgotPassword"
];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const isErrorPage = pageProps?.statusCode === 404;
  return (
    <>
       {!pathsWithoutDefaultLayout.includes(router.pathname) &&
            !isErrorPage ? (
              <Layout>
                 <ToastContainer position="top-right" autoClose={3000} />
                <Component {...pageProps} />
              </Layout>
            ) : (
              <Component {...pageProps} />
            )}
    
    </>
  )
}