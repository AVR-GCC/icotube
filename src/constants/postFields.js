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
            multiple: true,
            type: 'enum',
            enum: [
                'BTC',
                'Ethereum',
                'USDT'
            ],
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
            name: 'officialChat',
            label: 'Official Chat',
            type: 'string',
        },
        {
            name: 'github',
            label: 'Github',
            type: 'string',
        },
        {
            name: 'bitcoinTalk',
            label: 'Bitcoin Talk',
            type: 'string',
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
        },
        {
            name: 'videoUrl',
            label: 'Video URL',
            type: 'string'
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