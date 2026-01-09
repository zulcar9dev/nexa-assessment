import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponse, ErrorCode } from '@/types/api';

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json<ApiResponse<T>>({
        success: true,
        data,
        message,
    }, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
    code: ErrorCode,
    message: string,
    details?: any,
    status: number = 500
) {
    return NextResponse.json<ApiResponse>({
        success: false,
        error: {
            code,
            message,
            details,
        },
    }, { status });
}

/**
 * Centralized error handler for try-catch blocks
 */
export function handleApiError(error: unknown) {
    console.error('API Error:', error);

    // Handle Zod Errors
    if (error instanceof ZodError) {
        return errorResponse(
            'VALIDATION_ERROR',
            'Validation failed',
            error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            })),
            400
        );
    }

    // Handle string errors (throw "message")
    if (typeof error === 'string') {
        return errorResponse('INTERNAL_ERROR', error);
    }

    // Handle Error objects
    if (error instanceof Error) {
        // You could check for specific Prisma errors here if needed
        return errorResponse('INTERNAL_ERROR', error.message);
    }

    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred');
}
