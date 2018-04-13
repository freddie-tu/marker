export abstract class IConverterService {    
  abstract init(): void;
  abstract done(): void;
  abstract convert(folder: string, src: string): string;
}