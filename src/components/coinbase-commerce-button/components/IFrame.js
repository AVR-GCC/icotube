import * as React from 'react';
import {MessageData} from '../types';
import {generateUUID} from '../utils';
import './LoadingSpinner.css';
import './iframe.css';

type Props = {
  checkoutId?: string,
  chargeId?: string,
  customMetadata?: string,
  onLoad: () => void,
  onChargeSuccess: (MessageData) => void,
  onChargeFailure: (MessageData) => void,
  onPaymentDetected: (MessageData) => void,
  onError: (MessageData) => void,
  onModalClose: () => void,
  disableCaching: boolean
};

type State = {
  loading: boolean,
  src: null | string
};

type SrcParams = {
  origin: string,
  version: string,
  buttonId: string,
  custom?: string,
  cacheDisabled: boolean
}

export default class IFrame extends React.Component<Props, State> {
  origin: string;
  uuid: string;
  hostName: string;

  constructor(props: Props) {
    console.log('IFrame constructor 1');
    super(props);

    this.origin = 'https://commerce.coinbase.com';
    this.uuid = generateUUID();
    console.log('IFrame constructor', this.uuid);

    this.state = {
      loading: true,
      src: null
    }
  }

  componentDidMount(){
    // Add event listeners for the iframe
    window.addEventListener('message', this.handleMessage);
    const hostName = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/`;
    console.log('IFrame componentDidMount', hostName);
    this.setState({ src: this.buildSrc(hostName) });
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
  }

  buildSrc = (hostName: string): string => {
    const {checkoutId, chargeId, customMetadata, disableCaching} = this.props;

    function encodeURIParams(params) {
      let encoded = [];
      let quote = window.encodeURIComponent;
      for (let key in params) {
        if (params.hasOwnProperty(key)) {
          encoded.push(quote(key) + '=' + quote(params[key]));
        }
      }
      return encoded.join('&');
    }

    let widgetType;
    let id;
    if (checkoutId) {
      id = checkoutId;
      widgetType = 'checkout';
    } else if (chargeId) {
      id = chargeId;
      widgetType = 'charges';
    } else {
      throw new Error('must supply either checkoutId or chargeId prop');
    }

    const params: SrcParams = {
      origin: hostName,
      version: '0.1.0',
      buttonId: this.uuid,
      cacheDisabled: disableCaching
    };

    let custom = '';
    if (customMetadata && typeof customMetadata !== 'string') {
      console.error('Received customMetadata not of "string" type. Ignoring.');
    } else if (customMetadata) {
      custom = customMetadata
    }

    if (custom){
      params.custom = custom
    }

    return `${this.origin}/embed/${widgetType}/${encodeURI(id)}?${encodeURIParams(params)}`;
  };

  /*
   * If the message on this window is coming from coinbase commerce, and the ID of message
   * matches the ID we generated in our constructor, we can assume this message is valid and meant
   * for us to action.
   */
  isValidMessage = (msg: { origin: string, data: { buttonId?: string } }): boolean => {
    return msg.origin === this.origin && msg.data.buttonId === this.uuid;
  };

  /*
   * Handle any window message events here.
   * First, we ensure the message was meant for us.
   * We then match the event type to their callbacks,
   * ignoring any extra messages that may have been sent to us.
   */
  handleMessage = (msg: { origin: string, data: MessageData }) => {
    if (!this.isValidMessage(msg)) {
      return;
    }

    const {onChargeSuccess, onChargeFailure, onModalClose, onError, onPaymentDetected} = this.props;
    console.log('IFrame handleMessage', msg);

    switch (msg.data.event) {
      case 'charge_confirmed':
        onChargeSuccess && onChargeSuccess(msg.data);
        break;
      case 'charge_failed':
        onChargeFailure && onChargeFailure(msg.data);
        break;
      case 'payment_detected':
        onPaymentDetected && onPaymentDetected(msg.data);
        break;
      case 'error_not_found':
        onError(msg.data);
        break;
      case 'checkout_modal_closed':
        onModalClose();
        break;
      default:
        // Do nothing
        break;
    }
  };

  handleIFrameLoaded = () => {
    console.log('IFrame handleIFrameLoaded');
    this.setState({loading: false});
    this.props.onLoad && this.props.onLoad();
  };

  render() {
    const { loading, src } = this.state;

    return (
      <div className="coinbase-commerce-iframe-container">
        {(loading || src === null) && (
          <div className="commerce-loading-spinner"/>
        )}
        {src !== null && (
          <iframe
            title="coinbase-commerce-iframe"
            onLoad={this.handleIFrameLoaded}
            className="coinbase-commerce-iframe"
            src={src}
            scrolling="no"
            frameBorder="no"
          />
        )}
      </div>
    )
  }
}
