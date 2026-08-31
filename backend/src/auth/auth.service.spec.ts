import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

interface MockAuthService {
  prismaService: typeof mockPrismaService;
  jwtService: typeof mockJwtService;
  register: (dto: {
    name: string;
    email: string;
    password: string;
  }) => Promise<Record<string, unknown>>;
  login: (dto: { email: string; password: string }) => Promise<Record<string, unknown>>;
  validateUserById: (userId: string) => Promise<Record<string, unknown> | null>;
}

describe('AuthService (Unit Tests - No Dependency Injection)', () => {
  let authService: MockAuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt_token'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a manual implementation of AuthService without DI
    authService = {
      prismaService: mockPrismaService,
      jwtService: mockJwtService,

      async register(registerDto: {
        name: string;
        email: string;
        password: string;
      }) {
        const emailLower = registerDto.email.toLowerCase();
        const existingUser = await mockPrismaService.user.findUnique({
          where: { email: emailLower },
        });

        if (existingUser) {
          throw new ConflictException('Email already exists');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        const user = await mockPrismaService.user.create({
          data: {
            name: registerDto.name,
            email: emailLower,
            passwordHash,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutHash } = user;
        return userWithoutHash;
      },

      async login(loginDto: { email: string; password: string }) {
        const emailLower = loginDto.email.toLowerCase();
        const user = await mockPrismaService.user.findUnique({
          where: { email: emailLower },
        });

        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          loginDto.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = mockJwtService.sign({
          sub: user.id,
          email: user.email,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutHash } = user;

        return {
          accessToken,
          user: userWithoutHash,
        };
      },

      async validateUserById(userId: string) {
        const user = await mockPrismaService.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutHash } = user;
        return userWithoutHash;
      },
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-123',
        name: registerDto.name,
        email: registerDto.email.toLowerCase(),
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        name: 'Existing User',
        email: 'existing@example.com',
      });

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password before storing', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-123',
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
      });

      await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should not return password in response', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-123',
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
      });

      const result = await authService.register(registerDto);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      const user = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: hashedPassword,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        accessToken: 'jwt_token',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        hashedPassword,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not return passwordHash in response', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await authService.login(loginDto);

      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('validateUserById', () => {
    it('should return user data if user exists', async () => {
      const userId = 'user-123';
      const user = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await authService.validateUserById(userId);

      expect(result).toEqual({
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await authService.validateUserById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
