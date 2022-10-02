export const fields = {
    ICO: [
        {
            name: 'email',
            label: 'Submitter Email',
            type: 'string',
            required: true
        },
        {
            name: 'title',
            label: 'Project Name',
            type: 'string'
        },
        {
            name: 'type',
            label: 'Project Category',
            type: 'enum',
            enum: [
                'Platform',
                'Blockchain Service',
                'Gaming',
                'Network',
                'Market',
                'Protocol',
                'Defi',
                'P2E',
                'NFT',
                'Web3',
                'Other'
            ],
            default: 'Platform'
        },
        {
            name: 'importantNote',
            label: 'Important Note',
            type: 'string',
            placeholder: 'ICO will take place on X platform at 00:00 GMT',
            multiline: true,
            default: ''
        },
        {
            name: 'shortDescription',
            label: 'Short Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'description',
            label: 'Long Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'tokenRole',
            label: 'Token Role',
            type: 'enum',
            enum: [
                'Utility',
                'Payment',
                'Security',
                'Stablecoin',
                'Asset-backed',
                'DeFi token',
                'NFT',
                'Other'
            ],
            default: 'Platform'
        },
        {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            default: Date.now()
        },
        {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            optional: true
        },
        {
            name: 'ticker',
            label: 'Ticker',
            type: 'string'
        },
        {
            name: 'tokenType',
            label: 'Token Type (ERC-20 / BEP-20 / etc)',
            type: 'string'
        },
        {
            name: 'amountPerUser',
            label: 'Price/Amount Per User',
            type: 'number'
        },
        {
            name: 'softCap',
            label: 'Soft Cap',
            type: 'number'
        },
        {
            name: 'cap',
            label: 'Hard Cap',
            type: 'number'
        },
        {
            name: 'fundraisingGoal',
            label: 'Fundraising Goal',
            type: 'number'
        },
        {
            name: 'totalTokens',
            label: 'Total Tokens',
            type: 'number'
        },
        {
            name: 'availableTokens',
            label: 'Available Tokens',
            type: 'number'
        },
        {
            name: 'minParticipation',
            label: 'Minimum Participation',
            type: 'number'
        },
        {
            name: 'maxParticipation',
            label: 'Maximum Participation',
            type: 'number'
        },
        {
            name: 'accepts',
            label: 'Accepts',
            type: 'string',
            placeholder: 'BTC, ETH, USD...'
        },
        {
            name: 'isWhitelist',
            label: 'Whitelist',
            type: 'boolean',
            default: false
        },
        // { TODO - Implement
        //     name: 'restrictedCountries',
        //     label: 'Restricted Countries',
        //     type: 'list',
        // },
        {
            name: 'whitepaperLink',
            label: 'Whitepaper Link',
            type: 'string',
            link: true,
        },
        {
            name: 'officialChat',
            label: 'Official Chat',
            type: 'string',
            link: true,
        },
        {
            name: 'github',
            label: 'Github',
            type: 'string',
            link: true,
        },
        {
            name: 'bitcoinTalk',
            label: 'Bitcoin Talk',
            type: 'string',
            link: true,
        },
        {
            name: 'logo',
            label: 'Logo',
            type: 'image',
        },
        {
            name: 'homepage',
            label: 'Homepage',
            type: 'string',
            link: true,
        },
        {
            name: 'videoUrl',
            label: 'Video URL',
            type: 'string',
            link: true,
        },
    ],
    Airdrop: [
        {
            name: 'email',
            label: 'Contact Email',
            type: 'string',
            required: true
        },
        {
            name: 'title',
            label: 'Title',
            type: 'string',
            required: true
        },
        {
            name: 'description',
            label: 'Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'ticker',
            label: 'Ticker',
            type: 'string',
            required: true
        },
        {
            name: 'tokenType',
            label: 'Token Type',
            type: 'string',
            default: 'ERC20'
        },
        {
            name: 'homepage',
            label: 'Homepage',
            type: 'string',
        },
        {
            name: 'videoUrl',
            label: 'Video URL',
            type: 'string',
            required: true
        },
        {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            default: Date.now()
        },
        {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            default: Date.now()
        },
    ],
    NFT: [
        {
            name: 'email',
            label: 'Contact Email',
            type: 'string',
            required: true
        },
        {
            name: 'title',
            label: 'Title',
            type: 'string',
            required: true
        },
        {
            name: 'description',
            label: 'Description',
            type: 'string',
            multiline: true,
            default: ''
        },
        {
            name: 'ticker',
            label: 'Ticker',
            type: 'string',
            required: true
        },
        {
            name: 'homepage',
            label: 'Homepage',
            type: 'string',
        },
        {
            name: 'videoUrl',
            label: 'Video URL',
            type: 'string',
            required: true
        },
    ]
}