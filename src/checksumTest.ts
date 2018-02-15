const jsSHA = require("jssha");
const Hashids = require('hashids');
const hasher = require("hash-index");

class CheckSumTest {
    private array: string[] = [];
    private numberOfGuids: number = 10000;

    public run(): void {
        this.print("Starting");

        const sortedGuids = this.createSortedGuids(this.numberOfGuids);
        this.print("generated " + sortedGuids.length + " guids.");
        this.validateArray("sortedGuids", sortedGuids);

        const sortedHashes: string[] = this.createHashArray(sortedGuids);
        this.print("generated " + sortedHashes.length + " hash-values.");
        this.validateArray("sortedHashes", sortedHashes);

        const sortedAdlerChecksums: string[] = this.createAdlerChecksumArray(sortedHashes);
        this.print("generated " + sortedAdlerChecksums.length + " alder-checksums.");
        this.validateArray("sortedAdlerChecksums", sortedAdlerChecksums);
        this.checkMaxLength(sortedAdlerChecksums);

        const sortedHashIdsArray: string[] = this.createHashIdsArray(sortedHashes);
        this.print("generated " + sortedHashIdsArray.length + " hash-ids.");
        this.validateArray("sortedHashIdsArray", sortedHashIdsArray);
        this.checkMaxLength(sortedHashIdsArray);
        
        const sortedHashIndexArray: string[] = this.createHashIndexArray(sortedHashes);
        this.print("generated " + sortedHashIndexArray.length + " hash-indexes.");
        this.validateArray("sortedHashIndexArray", sortedHashIndexArray);
        this.checkMaxLength(sortedHashIndexArray);
    }

    private createSortedGuids(numberOfGuids: number): string[] {
        const array: string[] = [];
        for (let index = 0; index < numberOfGuids; index++) {
            array.push(this.generateGuid());
        }
        return array.sort();
    }

    private checkMaxLength(array: string[]) {
        let maxLength: number = 0;
        for (const value of array) {
            maxLength = value.toString().length > maxLength ? value.toString().length : maxLength;
        }
        this.print("MaxLength: " + maxLength);
    }

    private generateGuid(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private print(text: string): void {
        const element: HTMLParagraphElement = document.createElement("p");
        element.innerText = text;
        document.getElementById("result").appendChild(element);
    }

    private createHashIndexArray(hashArray: string[]) {
        const checksumArray: string[] = [];
        for (const hash of hashArray) {
            checksumArray.push(hasher(hash, 99999999999999999999));
        }
        return checksumArray.sort();
    }

    private createHashIdsArray(hashArray: string[]) {
        const hashId = new Hashids();
        const array: string[] = [];
        for (const hash of hashArray) {
            const arr = [];
            for (let index = 0; index < hash.length; index++) {
                arr.push(hash.charCodeAt(index));
            }
            array.push(hashId.encode(arr));
        }
        return array;
    }

    private createAdlerChecksumArray(hashArray: string[]) {
        const checksumArray: string[] = [];
        for (const hash of hashArray) {
            checksumArray.push(this.calculateChecksum(hash));
        }
        return checksumArray.sort();
    }

    private calculateChecksum(text: string): string {
        const MOD_ADLER = 65521;
        let a = 1;
        let b = 0;
        for (let index = 0; index < text.length; ++index) {
            a = (a + text.charCodeAt(index)) % MOD_ADLER;
            b = (b + a) % MOD_ADLER;
        }
        const result = (b << 16) | a;
        return result.toString();
    }

    private createHashArray(array: string[]): string[] {
        const hashArray: string[] = [];
        for (const arr of array) {
            hashArray.push(this.generateHash(arr));
        }
        return hashArray.sort();
    }

    private generateHash(value: string): string {
        const jsSha = new jsSHA("SHA-512", "TEXT");
        jsSha.update(value);
        const hash: string = jsSha.getHash("HEX");
        return hash;
    }

    private validateArray(arrayName: string, array: string[]): void {
        this.print("Validating " + arrayName);
        let numberOfCollisions: number = 0;
        for (let index = 0; index < array.length - 1; index++) {
            if (!this.compareArrays(array[index], array[index + 1])) {
                numberOfCollisions++;
            }
        }
        if (numberOfCollisions > 0) {
            this.print("NumberOfCollisions: " + numberOfCollisions);
            this.print("Number of hashes: " + array.length);
            this.print("NumberOfCollisions %: " + numberOfCollisions / array.length);
        } else {
            this.print("Validation: OK");
        }
    }

    private compareArrays(array1: string, array2: string) {
        let equalElements: number = 0;
        for (let index = 0; index < array1.length; index++) {
            if (array1[index] === array2[index]) {
                equalElements++;
            }
        }
        return equalElements === array1.length ? false : true;
    }
}

var checkSumTest = new CheckSumTest();
checkSumTest.run();
