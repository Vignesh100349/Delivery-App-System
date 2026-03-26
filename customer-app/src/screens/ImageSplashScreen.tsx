import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';

interface Props {
    onFinish: () => void;
}

export function ImageSplashScreen({ onFinish }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <Image
            source={require('../../assets/loopie_logo.png')}
            style={styles.image}
            resizeMode="contain"
        />
    );
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#050505',
    }
});
