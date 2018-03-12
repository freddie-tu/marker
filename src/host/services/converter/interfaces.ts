export abstract class IConverterService {    
  abstract init(): void;
  abstract done(): void;
  abstract convert(src: string): string;
}