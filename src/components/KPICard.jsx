import React from 'react'

const KPICard = ({
    value = 0,
    label,
    icon: Icon,
    borderColor = 'blue',
    iconColor = 'blue'
}) => {

    const colorClasses = {
        blue: {
            border: 'border-blue-500',
            bg: 'bg-blue-100',
            text: 'text-blue-600'
        },
        yellow: {
            border: 'border-yellow-500',
            bg: 'bg-yellow-100',
            text: 'text-yellow-600'
        },
        green: {
            border: 'border-green-500',
            bg: 'bg-green-100',
            text: 'text-green-600'
        },
        purple: {
            border: 'border-purple-500',
            bg: 'bg-purple-100',
            text: 'text-purple-600'
        }
    };


    return (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colorClasses[borderColor].border}`}>
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${colorClasses[iconColor].bg} ${colorClasses[iconColor].text} mr-4`}>
                    {Icon && <Icon className="h-6 w-6" />}
                </div>
                <div>
                    <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
                    <p className="text-gray-600">{label}</p>
                </div>
            </div>
        </div>
    )
}

export default KPICard