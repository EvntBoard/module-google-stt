export class SpeechRec {
  private rec: any;
  private continuous: boolean;
  private interimResults: any;
  private resultConfidence: number | undefined;
  private resultValue: any | undefined;
  private resultJSON: any | undefined;
  public resultString: string | undefined;
  public onResult: any;
  public onStart: any;
  public onError: any;
  public onEnd: any;

  constructor(_lang?: string) {
    if ((<any>window)?.webkitSpeechRecognition) {
      this.rec = new (<any>window).webkitSpeechRecognition();
    } else if ((<any>window)?.SpeechRecognition) {
      this.rec = new (<any>window).SpeechRecognition();
    } else {
      throw new Error("SpeechRecognition not supported in this browser.");
    }

    if (_lang !== undefined) this.rec.lang = _lang;
    this.continuous = false;
    this.interimResults = false;

    this.rec.onresult = (e: any) => {
      this.resultJSON = e;
      this.resultValue = e.returnValue;
      this.resultString = e.results[e.results.length-1][0].transcript.trim();
      this.resultConfidence = e.results[e.results.length-1][0].confidence;
      if(this.onResult) this.onResult();
    };

    this.rec.onstart = (e: any) => {
      if (this.onStart) this.onStart(e);
    };
    this.rec.onerror = (e: any) => {
      if (this.onError) this.onError(e);
    };

    this.rec.onend = () => {
      if (this.onEnd) this.onEnd();
    };

    console.log({
      resultConfidence: this.resultConfidence,
      resultString: this.resultString,
      resultValue: this.resultValue,
      resultJSON: this.resultJSON,
    })
  }

  public start(_continuous?: boolean, _interim?: boolean) {
    if ('webkitSpeechRecognition' in window) {
      if (_continuous !== undefined) this.continuous = _continuous;
      if (_interim !== undefined) this.interimResults = _interim;
      this.rec.continuous = this.continuous;
      this.rec.interimResults = this.interimResults;
      this.rec.start();
    }
  }
}