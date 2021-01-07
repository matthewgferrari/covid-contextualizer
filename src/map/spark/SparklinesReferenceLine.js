import PropTypes from 'prop-types';
import React from 'react';
import * as dataProcessing from './dataProcessing';

export default class SparklinesReferenceLine extends React.Component {

    static propTypes = {
        type: PropTypes.oneOf(['max', 'min', 'mean', 'avg', 'median', 'custom', 'atZero']),
        value: PropTypes.number,
        style: PropTypes.object
    };

    static defaultProps = {
        type: 'mean',
        style: { stroke: 'red', strokeOpacity: .75, strokeDasharray: '2, 2' }
    };

    render() {

        const { points, margin, type, style, value, refValue } = this.props;
        console.log(refValue)

        const ypoints = points.map(p => p.y);
        const y = type == 'atZero' ? refValue :  (type == 'custom' ? value : dataProcessing[type](ypoints));

        return (
            <line
            aria-label="panel" 
                x1={points[0].x} y1={y + margin}
                x2={points[points.length - 1].x} y2={y + margin}
                style={style} />
        )
    }
}
