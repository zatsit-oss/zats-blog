import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { WebsiteCarbonBadge } from 'react-websitecarbon-badge';

const ZatsWebsiteCarbonBadge = () => {
    const { colorMode } = useColorMode();
    return (
        <WebsiteCarbonBadge lang="fr" dark={colorMode === 'dark'} url={"https://zatsit-blog.web.app/"} />
    );
};
export default ZatsWebsiteCarbonBadge;
