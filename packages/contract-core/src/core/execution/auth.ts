import {Metadata} from "@grpc/grpc-js";

export class Auth {
    constructor(private _authToken: string) {
    }

    public authToken() {
        return this._authToken;
    }

    public metadata(): Metadata {
        const metadata = new Metadata();

        metadata.set('authorization', this._authToken);

        return metadata;
    }
}