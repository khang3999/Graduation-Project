declare module 'react-native-momosdk' {
    interface MoMoResponse {
      status: number;
      data?: string;
      phonenumber?: string;
      message?: string;
      refOrderId?: string;
      refRequestId?: string;
      fromapp?: string;
    }
    
    export function requestPayment(jsonData: any): Promise<MoMoResponse>;
    const RNMomosdk: {
      requestPayment: typeof requestPayment;
    };
    export default RNMomosdk;
  }
  