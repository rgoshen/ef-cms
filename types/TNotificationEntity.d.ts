type TBounceRecipient = {
  emailAddress: string;
  diagnosticCode: string;
};

type TBounce = {
  bounceSubType: string;
  bounceType: string;
  bouncedRecipients: TBounceRecipient[];
};

type TNotification = {
  mail: {
    commonHeaders: any;
  };
  bounce: {
    bouncedRecipients: any[];
    bounceSubType: any;
    bounceType: any;
  };
};