import type { PropsWithChildren } from "react";

export const Layout = (props: PropsWithChildren) => {
    return (
        <>
            {props.children}
        </>
    );
};
