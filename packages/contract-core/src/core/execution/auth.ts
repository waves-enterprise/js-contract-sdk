import { Metadata } from '@grpc/grpc-js'

export class Auth {
  constructor(private _authToken: string) {
  }

  authToken() {
    return this._authToken
  }

  metadata(): Metadata {
    const metadata = new Metadata()

    metadata.set('authorization', this._authToken)

    return metadata
  }
}