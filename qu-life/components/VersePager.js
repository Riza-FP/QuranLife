import React from 'react';
import PagerView from 'react-native-pager-view';
import { StyleSheet } from 'react-native';

const VersePager = React.forwardRef(({ children, initialPage = 0, style, ...props }, ref) => {
    return (
        <PagerView
            ref={ref}
            style={[styles.pagerView, style]}
            initialPage={Number(initialPage)}
            {...props}
        >
            {children}
        </PagerView>
    );
});

export default VersePager;

const styles = StyleSheet.create({
    pagerView: {
        flex: 1,
    },
});
